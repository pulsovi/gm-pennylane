type Listener = (data: unknown) => void;

export default class EventEmitter {
  private events: Record<string, Listener[]> = {};

  // Abonner une fonction à un événement
  on(event: string, listener: Listener): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  // Abonner une fonction à un événement une seule fois
  once(event: string, listener: Listener): this {
    const proxy = data => {
      listener(data);
      this.off(event, proxy)
    };
    this.on(event, proxy);
    return this;
  }

  // Désabonner une fonction d'un événement
  off(event: string, listener: Listener): this {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  // Déclencher un événement avec des données
  emit(event: string, data?: unknown): this {
    if (!this.events[event]) return this;
    this.events[event].forEach(listener => listener(data));
    return this;
  }
}
