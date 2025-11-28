import { Effect } from './effects/Effect';

export class EffectChain {
    effects: Effect[] = [];

    add(effect: Effect) {
        this.effects.push(effect);
    }

    remove(id: string) {
        this.effects = this.effects.filter(e => e.id !== id);
    }

    move(fromIndex: number, toIndex: number) {
        const [removed] = this.effects.splice(fromIndex, 1);
        this.effects.splice(toIndex, 0, removed);
    }

    getEffects() {
        return this.effects;
    }
}
