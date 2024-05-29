export function validate(schema: any, input:unknown){
  const valResult =  schema.safeParse(input)

  if(valResult.success){
    return true
  }

  return valResult.error.flatten().fieldErrors
}