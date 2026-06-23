/**
 * Wrapper expo-notifications (V6, ITEM-42).
 *
 * Agendar lembrete diario de estudo + 3 mensagens variantes.
 * Opt-in via ConfigScreen (settings.notificacoes).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
      hour,
      minute,
    },
  });
}

export async function cancelarTodos(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function obterStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}