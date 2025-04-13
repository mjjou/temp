import { Movie } from '../../models/Movie';

export interface SearchStrategy {
  search(keyword: any): Promise<InstanceType<typeof Movie>[]>;
  
}
