import { SearchStrategy } from "./SearchStrategy";
import { Movie } from "../../models/Movie";



export class MultipleSearch implements SearchStrategy{
    async search(keywordAndTag: { keyword: string, tags: string }){
        const { keyword, tags } = keywordAndTag; 
        const allTag = tags.split(',').map(tag=>tag.trim().toLowerCase()).filter(Boolean);
        const query: any = {};
        if(keyword){
            query.title = { $regex: keyword, $options: 'i' };
        }
        
        if(allTag.length>0){
            query.genre={$all:allTag};
        }

        return Movie.find(query);
    }
}