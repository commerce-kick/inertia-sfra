import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import type { Product } from "@/types/productFactory"

interface ProductVariationResponse {
  product: Product
}

export default function useProductVariation() {
  const mutation = useMutation<ProductVariationResponse, Error, string>({
    mutationFn: async (url: string) => {
      const { data } = await axios.get<ProductVariationResponse>(url)
      return data
    },
  })

  return {
    mutate: mutation.mutate,
    data: mutation.data,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
