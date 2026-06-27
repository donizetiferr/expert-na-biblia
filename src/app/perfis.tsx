import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { lightTap, successBuzz } from '../lib/haptics';
import { garantirFreezeSemanal } from '../lib/streak';
import {
  listarPerfis,
  obterPerfilAtivo,
  criarPerfil,
  trocarPerfil,
  nomeValido,
  MAX_PERFIS,
  type Perfil,
  type PerfilTipo,
} from '../lib/perfis';

/**
 * V23.9 (milestone I): seletor de perfis locais (familia / multi-idade). Listar, trocar
 * (snapshot-swap isola o progresso) e criar perfis (tipo Adulto ou Kids). Sem login/backend.
 */
export default function PerfisScreen() {
  const router = useRouter();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [ativoId, setAtivoId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<PerfilTipo>('normal');
  const [ocupado, setOcupado] = useState(false);

  const recarregar = useCallback(async () => {
    const [lista, ativo] = await Promise.all([listarPerfis(), obterPerfilAtivo()]);
    setPerfis(lista);
    setAtivoId(ativo?.id ?? null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      recarregar().catch(() => {});
      return () => {
        ativo = false;
        void ativo;
      };
    }, [recarregar]),
  );

  const trocar = async (id: string) => {
    if (id === ativoId || ocupado) return;
    setOcupado(true);
    lightTap().catch(() => {});
    const ok = await trocarPerfil(id);
    if (ok) {
      // O perfil novo/destino assume o estado global — garante seu token de freeze semanal.
      await garantirFreezeSemanal().catch(() => {});
      successBuzz().catch(() => {});
      router.replace('/modos');
    } else {
      setOcupado(false);
    }
  };

  const criar = async () => {
    if (!nomeValido(nome) || ocupado) return;
    setOcupado(true);
    lightTap().catch(() => {});
    const novo = await criarPerfil(nome, tipo);
    setOcupado(false);
    if (novo) {
      setNome('');
      setTipo('normal');
      setCriando(false);
      await recarregar();
    }
  };

  const cheio = perfis.length >= MAX_PERFIS;

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTela}>Perfis</Text>
        <View style={styles.voltar} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitulo}>
          Cada perfil tem seu próprio progresso, streak e XP. Ideal para a família compartilhar o app.
        </Text>

        {perfis.map((p) => {
          const ativo = p.id === ativoId;
          return (
            <Pressable
              key={p.id}
              style={[styles.perfilCard, ativo && styles.perfilAtivo]}
              onPress={() => trocar(p.id)}
              disabled={ativo || ocupado}
              accessibilityRole="button"
              accessibilityLabel={`Perfil ${p.nome}${p.tipo === 'kids' ? ', modo kids' : ''}${ativo ? ', ativo' : ', tocar para trocar'}`}
            >
              <Text style={styles.perfilAvatar}>{p.tipo === 'kids' ? '🧒' : '👤'}</Text>
              <View style={styles.perfilInfo}>
                <Text style={styles.perfilNome}>{p.nome}</Text>
                <Text style={styles.perfilTipo}>{p.tipo === 'kids' ? 'Modo Kids' : 'Adulto'}</Text>
              </View>
              {ativo ? <Text style={styles.ativoTag}>ATIVO</Text> : <Text style={styles.trocarTag}>Trocar ›</Text>}
            </Pressable>
          );
        })}

        {criando ? (
          <View style={styles.formCriar}>
            <Text style={styles.formTitulo}>Novo perfil</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome (ex.: Maria)"
              placeholderTextColor={COLORS.cinzaMedio}
              value={nome}
              onChangeText={setNome}
              maxLength={20}
              accessibilityLabel="Nome do perfil"
            />
            <View style={styles.tipoLinha}>
              <Pressable
                style={[styles.tipoBtn, tipo === 'normal' && styles.tipoBtnAtivo]}
                onPress={() => setTipo('normal')}
                accessibilityRole="button"
                accessibilityLabel="Tipo Adulto"
              >
                <Text style={[styles.tipoBtnTexto, tipo === 'normal' && styles.tipoBtnTextoAtivo]}>👤 Adulto</Text>
              </Pressable>
              <Pressable
                style={[styles.tipoBtn, tipo === 'kids' && styles.tipoBtnAtivo]}
                onPress={() => setTipo('kids')}
                accessibilityRole="button"
                accessibilityLabel="Tipo Kids"
              >
                <Text style={[styles.tipoBtnTexto, tipo === 'kids' && styles.tipoBtnTextoAtivo]}>🧒 Kids</Text>
              </Pressable>
            </View>
            <Text style={styles.tipoDica}>
              {tipo === 'kids'
                ? 'Modo Kids: texto maior e perguntas mais fáceis no quiz.'
                : 'Experiência padrão do app.'}
            </Text>
            <View style={styles.formAcoes}>
              <Pressable style={styles.botaoSecundario} onPress={() => setCriando(false)} accessibilityRole="button" accessibilityLabel="Cancelar">
                <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.botaoPrimario, !nomeValido(nome) && styles.botaoDesabilitado]}
                onPress={criar}
                disabled={!nomeValido(nome)}
                accessibilityRole="button"
                accessibilityLabel="Criar perfil"
              >
                <Text style={styles.botaoPrimarioTexto}>Criar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={[styles.adicionar, cheio && styles.botaoDesabilitado]}
            onPress={() => !cheio && setCriando(true)}
            disabled={cheio}
            accessibilityRole="button"
            accessibilityLabel={cheio ? 'Limite de perfis atingido' : 'Adicionar perfil'}
          >
            <Text style={styles.adicionarTexto}>{cheio ? `Limite de ${MAX_PERFIS} perfis` : '+ Adicionar perfil'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.creme },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: ESPACAMENTOS.xl,
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingBottom: ESPACAMENTOS.sm,
  },
  voltar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  voltarTexto: { fontFamily: FONTES.display, fontSize: 40, color: COLORS.roxoEscuro },
  tituloTela: { fontFamily: FONTES.display, fontSize: 30, color: COLORS.roxoEscuro, letterSpacing: 1 },
  scroll: { paddingHorizontal: ESPACAMENTOS.lg, paddingBottom: ESPACAMENTOS.xxl, gap: ESPACAMENTOS.md },
  subtitulo: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.cinzaEscuro, textAlign: 'center' },
  perfilCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTOS.md,
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.cinzaMedio,
    padding: ESPACAMENTOS.md,
  },
  perfilAtivo: { borderColor: COLORS.laranjaForte, backgroundColor: COLORS.laranjaClaro },
  perfilAvatar: { fontSize: 40 },
  perfilInfo: { flex: 1 },
  perfilNome: { fontFamily: FONTES.bodyExtraBold, fontSize: 18, color: COLORS.roxoEscuro },
  perfilTipo: { fontFamily: FONTES.bodyBold, fontSize: 13, color: COLORS.cinzaEscuro },
  ativoTag: { fontFamily: FONTES.display, fontSize: 16, color: COLORS.laranjaForte, letterSpacing: 1 },
  trocarTag: { fontFamily: FONTES.bodyBold, fontSize: 14, color: COLORS.roxoPrimario },
  adicionar: {
    backgroundColor: COLORS.roxoEscuro,
    borderRadius: BORDAS.raioMedio,
    padding: ESPACAMENTOS.md,
    alignItems: 'center',
  },
  adicionarTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 16, color: COLORS.laranjaClaro },
  formCriar: {
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.preto,
    padding: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.sm,
  },
  formTitulo: { fontFamily: FONTES.display, fontSize: 22, color: COLORS.laranjaForte, letterSpacing: 1 },
  input: {
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaInput,
    borderRadius: BORDAS.raioPequeno,
    paddingHorizontal: ESPACAMENTOS.md,
    paddingVertical: ESPACAMENTOS.sm,
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.preto,
  },
  tipoLinha: { flexDirection: 'row', gap: ESPACAMENTOS.sm },
  tipoBtn: {
    flex: 1,
    paddingVertical: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.cinzaMedio,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  tipoBtnAtivo: { borderColor: COLORS.laranjaForte, backgroundColor: COLORS.laranjaClaro },
  tipoBtnTexto: { fontFamily: FONTES.bodyBold, fontSize: 15, color: COLORS.cinzaEscuro },
  tipoBtnTextoAtivo: { color: COLORS.roxoEscuro },
  tipoDica: { fontFamily: FONTES.bodyRegular, fontSize: 12, color: COLORS.cinzaEscuro },
  formAcoes: { flexDirection: 'row', gap: ESPACAMENTOS.sm, marginTop: ESPACAMENTOS.xs },
  botaoSecundario: {
    flex: 1,
    paddingVertical: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.cinzaMedio,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  botaoSecundarioTexto: { fontFamily: FONTES.bodyBold, fontSize: 15, color: COLORS.cinzaEscuro },
  botaoPrimario: {
    flex: 1,
    paddingVertical: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    backgroundColor: COLORS.laranjaForte,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  botaoPrimarioTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.branco },
  botaoDesabilitado: { opacity: 0.5 },
});
