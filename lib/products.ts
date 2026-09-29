export interface Category {
  slug: string
  name: string
  description: string
}

export interface Product {
  slug: string
  name: string
  image: string
  category: string
  description: string
  material: string
  size: string
  moq: string
}

export const categories: Category[] = [
  {
    slug: "dog-toys",
    name: "Dog Toys",
    description: "Professional Dog Toys",
  },
]

export const products: Product[] = [
  {
    slug: "durable-dog-bite-toy",
    name: "Durable Dog Bite Toy",
    image: "/images/product1.jpg",
    category: "dog-toys",
    description: "Professional training dog toy.",
    material: "Jute",
    size: "30cm",
    moq: "100 pcs",
  },
]

export function getCategory(slug: string) {
  return categories.find(c => c.slug === slug)
}

export function getProduct(slug: string) {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(category: string) {
  return products.filter(p => p.category === category)
}
