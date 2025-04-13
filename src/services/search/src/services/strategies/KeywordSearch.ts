import { SearchStrategy } from "./SearchStrategy";
import { Movie } from "../../models/Movie";

export class KeywordSearch implements SearchStrategy {
    async search(keyword: string) {
      return Movie.find({
        title: { $regex: keyword, $options: 'i' }
      });
    }
  }