export interface Category {
  slug: string
  name: string
}

export interface Product {
  name: string
  slug: string
  category: string
  image?: string
  description?: string

  material: string
  size: string
  moq: string
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

    image: "/images/product1.jpg",

    description: "Heavy duty dog bite toy.",

    material: "Jute + Cotton",

    size: "30cm",

    moq: "100 pcs",
  },
]

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug)
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category)
}
