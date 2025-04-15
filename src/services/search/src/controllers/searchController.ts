import { Request, Response } from 'express';
import { SearchContext } from '../services/SearchContext';
import { KeywordSearch } from '../services/strategies/KeywordSearch';
import { TagSearch } from '../services/strategies/TagSearch';
import { MultipleSearch } from '../services/strategies/MultipleSearch';

export const searchHandler = async (req: Request, res: Response): Promise<void> => {
  const type = req.query.type?.toString() || 'keyword';
  const keyword = req.query.keyword?.toString()|| '';
  const tag = req.query.tag?.toString()|| '';
  const context = new SearchContext();
  try{
    switch(type){
      case 'tag':
        context.setStrategy(new TagSearch());
        res.json(await context.search(tag));
        break;

      case 'keyword':
        context.setStrategy(new KeywordSearch());
        res.json(await context.search(keyword));
        break;
        
      case 'multi':
        context.setStrategy(new MultipleSearch());
        res.json(await context.search({ keyword, tags: tag }));
        break;

      default:
        context.setStrategy(new KeywordSearch());
        res.json(await context.search(keyword));
        break;
    } 
  }catch(error){
    console.log('search failed:',error)
    res.status(500).json({ error: 'Search failed', detail: (error as Error).message });
  }

};
                      