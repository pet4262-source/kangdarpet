export type Category = {
  slug: string
  name: string
  description: string
}


export type Product = {
  slug: string
  name: string
  description: string
  image: string
  material: string
  size: string
  moq: string
}


export const categories: Category[] = [
  {
    slug: "dog-toys",
    name: "Dog Toys",
    description:
      "Professional dog toys for training, interaction and daily play.",
  },
  {
    slug: "training-products",
    name: "Dog Training Products",
    description:
      "Durable training equipment for professional trainers.",
  },
]


export const products: Product[] = [
  {
    slug: "durable-dog-bite-toy",
    name: "Durable Dog Bite Toy",
    description:
      "High strength bite toy designed for working dogs and professional training.",
    image: "/images/bite-toy.png",
    material: "Oxford Fabric",
    size: "Custom Size",
    moq: "100pcs",
  },
]


export function getProduct(slug: string) {
  return products.find(
    (product) => product.slug === slug
  )
}


export function getCategory(slug: string) {
  return categories.find(
    (category) => category.slug === slug
  )
}


export function getProductsByCategory(slug: string) {
  return products.filter(
    (product) =>
      slug === "dog-toys"
  )
}
