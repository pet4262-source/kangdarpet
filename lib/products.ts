export type Category = {
  slug: string
  name: string
}


export type Product = {
  name: string
  slug: string
  category: string
  description?: string
  image?: string
}


export const categories: Category[] = [

  {
    slug: "dog-toys",
    name: "Dog Toys",
  },

  {
    slug: "dog-training",
    name: "Dog Training Supplies",
  },

]



export const products: Product[] = [

  {
    name: "Durable Dog Bite Toy",
    slug: "durable-dog-bite-toy",
    category: "dog-toys",
    description:
      "Professional durable bite toy for working dogs and training.",
    image:
      "/products/bite-toy.jpg",
  },


  {
    name: "Dog Training Tug Toy",
    slug: "dog-training-tug-toy",
    category: "dog-training",
    description:
      "High strength tug toy for K9 training.",
    image:
      "/products/tug-toy.jpg",
  },


]



export function getCategory(slug:string){

  return categories.find(
    item=>item.slug===slug
  )

}



export function getProduct(slug:string){

  return products.find(
    item=>item.slug===slug
  )

}



export function getProductsByCategory(slug:string){

  return products.filter(
    item=>item.category===slug
  )

}
