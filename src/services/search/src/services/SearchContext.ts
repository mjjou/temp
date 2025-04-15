import { SearchStrategy } from "./strategies/SearchStrategy";


export class SearchContext {
    private strategy!: SearchStrategy;
  
    setStrategy(strategy: SearchStrategy) {
      this.strategy = strategy;
    }
  
    async search(keyword: any) {
      if (!this.strategy) throw new Error("Strategy not set");
      return this.strategy.search(keyword);
    }
  }