import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  brandConfigSchema,
  type BrandConfig,
  type UpdateBrandColorsRequest,
} from '@/api/schemas/branding'
import { api } from '@/lib/api-client'

export const brandingKeys = {
  all: ['branding'] as const,
  config: () => [...brandingKeys.all, 'config'] as const,
}

/** The single active site-wide brand configuration. */
export function useBrandConfig() {
  return useQuery({
    queryKey: brandingKeys.config(),
    queryFn: () => api.get<BrandConfig>('/branding', brandConfigSchema),
    staleTime: Infinity,
  })
}

/** Updates country name, primary/secondary/text colour. Logo is a separate upload. */
export function useUpdateBrandColors() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBrandColorsRequest) =>
      api.put<BrandConfig>('/branding', input, brandConfigSchema),
    onSuccess: (updated) => client.setQueryData(brandingKeys.config(), updated),
  })
}

/** Uploads a new logo image, replacing the current one. */
export function useUploadBrandLogo() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post<BrandConfig>('/branding/logo', formData, brandConfigSchema)
    },
    onSuccess: (updated) => client.setQueryData(brandingKeys.config(), updated),
  })
}
