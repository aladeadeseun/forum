import { Types } from "mongoose"

type MapListToDictionaryType<T> = Record<string, T>

export default {
  /**
   * This will map the id of the object fetch from the database to the id so I can place them in array bae on the
   * postion of the id it represent from dataloader.
   */
  mapListToDictionary<T extends {_id:Types.ObjectId}>(list:T[], getKeyCallback?:((item:T)=>string)): MapListToDictionaryType<T>{

    const store: MapListToDictionaryType<T> = {} as MapListToDictionaryType<T>

    let key: string

    const hasGetKeyCallback = !!getKeyCallback

    for(const item of list){
      key = hasGetKeyCallback ? getKeyCallback(item) : item._id.toHexString()
      store[key] = item
    }

    return store
  },

  /**
   * Position the object to match the position in array from dataloader.
   */
  mapDictToList<T extends {_id:Types.ObjectId}>(keys: readonly string[], listDict:MapListToDictionaryType<T>, __default:any | null){
    
    const output:(T | null)[] = []

    for(const k of keys){
      output.push((listDict[k] || __default))
    }
    return output
  }
}