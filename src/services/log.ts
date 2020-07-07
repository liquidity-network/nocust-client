export const log = (title: string, data: Object) =>
  console.log(`============= ${title} =============`, JSON.stringify(data, undefined, 2))
