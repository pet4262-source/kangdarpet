export type Category = {
  slug: string
  name: string
}

export type Product = {
  name: string
  slug: string
  category: string
}


export const categories: Category[] = [
  {
    slug: "dog-toys",
    name: "Dog Toys",
  },
]


export const products: Product[] = [
  {
    name: "Durable Dog Bite Toy",
    slug: "durable-dog-bite-toy",
    category: "dog-toys",
  },
]


// 获取分类
export function getCategory(slug: string) {
  return categories.find(
    (category) => category.slug === slug
  )
}


// 获取单个产品
export function getProduct(slug: string) {
  return products.find(
    (product) => product.slug === slug
  )
}


// 获取分类下面的产品
export function getProductsByCategory(categorySlug: string) {
  return products.filter(
    (product) => product.category === categorySlug
  )
}
