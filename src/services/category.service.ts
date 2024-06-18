import { default as CategoryModel, default as categorySchema } from "../model/category.schema";
import { CreateCategoryInput } from "../types";

export default class CategoryService {

  private async getCategoryByName(name: string){
    name = name.toLocaleUpperCase()
    //fetch 
    return CategoryModel.findOne({name}).select(["deletedAt", "_id", "name", "createdAt", "updatedAt"])
  }

  async create({name}:CreateCategoryInput){
    
    let catModel = await this.getCategoryByName(name)

    //if the category exist and its not deleted, then can create, return false to indicate the category already exist
    if(catModel){
      if(catModel.deletedAt === null)
        return false
      else{
        catModel.deletedAt = null
      }
    }else{
      return CategoryModel.create({name})
      //catModel = new CategoryModel()
      //catModel.name = name
    }
    //
    return catModel.save()
  }

  async update({name}:CreateCategoryInput, _id:string){
    //get category by id
    const catModel = await categorySchema.findById(_id)
    //if the category does not exist return 1 to indicate the category does not exist
    if(!catModel || catModel.deletedAt !== null) return 1
    //check if the name already exist

    const prevCat = await this.getCategoryByName(name)

    // console.log(prevCat, prevCat!._id.toHexString(), _id)
    // console.log((prevCat && prevCat._id.toHexString() !== _id && prevCat.deletedAt === null))

    //if the previous category exists
    if(prevCat && (prevCat._id.toHexString() !== _id) && prevCat.deletedAt === null){
      return false
    }

    catModel.name = name

    return catModel.save()
  }

  async delete(_id:string){
    //get category by id
    const catModel = await categorySchema.findById(_id)
    //if the category does not exist return 1 to indicate the category does not exist
    if(!catModel) return 1
    catModel.deletedAt = new Date()

    return catModel.save()
  }

  async read(){
    return CategoryModel.find({deletedAt:null})
  }
}