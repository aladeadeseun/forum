import dotenv from 'dotenv';
import { join } from "path";
import { z } from "zod";

import Env from "../Env";

type EnvType = z.infer<typeof Env>

type ConfigReturnType<K extends keyof EnvType> = EnvType[K]

const parsedEnvFile = dotenv.config({
  path:join(__dirname, "..", "..", ".env"),
  //encoding:"utf-8"
})

const configValue = Env.parse(parsedEnvFile.parsed)

console.log("config initialization ran")

export default function getConfig<
  K extends keyof EnvType
>(key: K, defaultValue?: ConfigReturnType<K>): ConfigReturnType<K>{
  const value: ConfigReturnType<K> | undefined = configValue[key]

  if(!value){
    if(defaultValue)
      return defaultValue
    //end if
    throw new Error(`${key} not set in the configuration file.`)
  }//end if not 
  return value
}

//console.log(configValue)


