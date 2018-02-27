import * as Visibility from 'visibilityjs';

export type ActionFn = (visibilityTime: number) => any;

interface Action {
  timeout: number;
  action: ActionFn;
}

export default abstract class PageTime {
  private static visibilityTimeCounter: number = 0;
  private static lastVisibleStart: number | null = null;
  private static milestones: Action[] = [];

  static visibilityTime() {
    if (Visibility.hidden()) {
      return this.visibilityTimeCounter;
    } else {
      // we know that last visible start should then be set
      return new Date().getTime() - this.lastVisibleStart! + this.visibilityTimeCounter;
    }
  }

  static measure() {
    Visibility.change((e, state) => {
      if (Visibility.hidden()) {
        if (this.lastVisibleStart !== null) {
          this.visibilityTimeCounter += new Date().getTime() - this.lastVisibleStart;
        }
      } else {
        this.lastVisibleStart = new Date().getTime();
      }
    });

    // initialize the lastVisibleStart once
    if (!Visibility.hidden()) {
      this.lastVisibleStart = new Date().getTime();
    }

    let timer: any;
    timer = Visibility.every(1000, () => {
      const seen = this.visibilityTime();
      while (!this.milestonesEmpty() && (seen >= this.milestones[0].timeout)) {
        this.milestones.shift()!.action(seen);
      }

      if (this.milestonesEmpty()) {
        (Visibility as any).stop(timer);
      }
    });
  }

  /**
   * Perform an action after a certain amount of time.
   * Currently the finest possible steps are seconds.
   * @param timeout The time in miliseconds
   */
  static doAfter(timeout: number, action: ActionFn) {
    // insert sorted
    for (let i = 0; i < this.milestones.length; ++i) {
      if (this.milestones[i].timeout >= timeout) {
        this.milestones.splice(i, 0, { timeout, action });
        return;
      }
    }

    // ok we seem to be the biggest, push to the end
    this.milestones.push({ timeout, action });
  }

  static onUnload(action: ActionFn) {
    window.addEventListener('unload', () => {
      action(this.visibilityTime());
    }, false);
  }

  private static milestonesEmpty() {
    return this.milestones.length === 0;
  }
}
