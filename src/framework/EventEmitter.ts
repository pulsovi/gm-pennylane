type Listener = (data: unknown) => void;

export default class EventEmitter {
  private events: Record<string, Listener[]> = {};

  // Abonner une fonction à un événement
  on(event: string, listener: Listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  // Désabonner une fonction d'un événement
  off(event: string, listener: Listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  // Déclencher un événement avec des données
  emit(event: string, data: unknown) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }
}
