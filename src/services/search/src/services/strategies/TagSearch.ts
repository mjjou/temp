import { SearchStrategy } from './SearchStrategy';
import { Movie } from '../../models/Movie';

export class TagSearch implements SearchStrategy {
  async search(keyword: string) {
    const tags = keyword.split(',').map(tag=>tag.trim().toLowerCase());
    return Movie.find({
      genre: { $in: tags }
    });
  }
}
