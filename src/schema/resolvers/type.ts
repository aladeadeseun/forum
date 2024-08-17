import { Category } from "../../model/category.schema";
import { Thread } from "../../model/thread.schema";
import { Context } from "../../util/context";

export default {
  Thread:{
    category({category}:Thread, _args:any, {categoryService}: Context){
      //if the category is an instance of category object return it
      if(category instanceof Category) return category
      return categoryService.loadCategoryById(category.toHexString())
    },
  }
}