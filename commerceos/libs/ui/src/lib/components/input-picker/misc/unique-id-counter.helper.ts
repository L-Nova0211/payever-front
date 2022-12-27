class IdCounter {
  private id = 0;

  getIdCounter() {
    return this.id++;
  }
}

const counter = new IdCounter();
export const getUniqueId = () => counter.getIdCounter();
