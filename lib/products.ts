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
    slug: "training-equipment",
    name: "Dog Training Equipment",
  },

  {
    slug: "bite-toys",
    name: "Bite Toys",
  },

]



export const products: Product[] = [

  {
    name: "Durable Dog Bite Toy",
    slug: "durable-dog-bite-toy",
    category: "bite-toys",
    description:
      "Professional dog bite toy for K9 training and working dogs.",
    image:
      "/products/bite-toy.jpg",
  },


  {
    name: "Interactive Dog Tug Toy",
    slug: "interactive-dog-tug-toy",
    category: "dog-toys",
    description:
      "Strong tug toy for professional dog trainers.",
    image:
      "/products/tug-toy.jpg",
  },


]





// 根据分类slug获取产品

export function getProductsByCategory(
  slug:string
){

 return products.filter(
   (product)=>
   product.category===slug
 )

}




// 根据slug获取分类

export function getCategory(
 slug:string
){

 return categories.find(
   (category)=>
   category.slug===slug
 )

}





// 根据slug获取产品

export function getProduct(
 slug:string
){

 return products.find(
   (product)=>
   product.slug===slug
 )

}
