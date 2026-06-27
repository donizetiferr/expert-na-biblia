/**
 * Wrapper expo-notifications (V6, ITEM-42).
 *
 * Agendar lembrete diario de estudo + 3 mensagens variantes.
 * Opt-in via ConfigScreen (settings.notificacoes).
 */

import * as Notifications from 'expo-notifications';

const MENSAGENS = [
  'Você já estudou hoje? Sua jornada bíblica continua! 📖',
  'Sua streak está em N dias! Não perca o ritmo. 🔥',
  'Que tal uma lição rápida? 5 minutos e você aprende algo novo! ✨',
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function solicitarPermissao(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  return final === 'granted';
}

export async function agendarLembreteDiario(hora = 19, minuto = 0): Promise<void> {
  const ok = await solicitarPermissao();
  if (!ok) {
    console.warn('[notifications] Permissao negada. Lembrete nao agendado.');
    return;
  }

  // Cancela lembretes anteriores
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Agenda proximo lembrete
  const agora = new Date();
  const proximo = new Date();
  proximo.setHours(hora, minuto, 0, 0);
  if (proximo <= agora) {
    proximo.setDate(proximo.getDate() + 1);
  }

  const mensagem = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)] ?? MENSAGENS[0]!;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expert Na Bíblia',
      body: mensagem,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
    },
  });
}

export async function cancelarTodos(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * V23.11 (K.3): win-back de inativos. Agenda (com identificador fixo) uma notificacao
 * gentil para daqui a N dias. Chamada a CADA abertura do app: como sempre cancela a
 * anterior e reagenda para frente, ela so dispara se o usuario ficar N dias sem abrir.
 * Tom encorajador (decisao de produto V23.1, #6) — nunca culpa.
 */
const WINBACK_ID = 'expert-winback';
const MENSAGENS_WINBACK = [
  'Sentimos sua falta! Que tal continuar sua jornada na Bíblia hoje? 💛',
  'Sua próxima lição está esperando por você. Bora aprender? 📖',
  'Um versículo novo pode iluminar o seu dia. Volte quando quiser! ✨',
];

export async function agendarWinBack(dias = 3): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return; // so agenda se ja houver permissao (nao pede aqui)
    try {
      await Notifications.cancelScheduledNotificationAsync(WINBACK_ID);
    } catch {
      // sem agendamento anterior
    }
    const segundos = Math.max(1, Math.floor(dias)) * 24 * 60 * 60;
    const mensagem = MENSAGENS_WINBACK[Math.floor(Math.random() * MENSAGENS_WINBACK.length)] ?? MENSAGENS_WINBACK[0]!;
    await Notifications.scheduleNotificationAsync({
      identifier: WINBACK_ID,
      content: { title: 'Expert Na Bíblia', body: mensagem, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: segundos,
        repeats: false,
      },
    });
  } catch (e) {
    console.warn('[notifications] agendarWinBack falhou:', e);
  }
}

export async function cancelarWinBack(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(WINBACK_ID);
  } catch {
    // sem agendamento
  }
}

export async function obterStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}