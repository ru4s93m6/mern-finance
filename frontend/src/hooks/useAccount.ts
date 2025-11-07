// hooks/useAccount.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Account, BasicAccount } from '@/types/account'

const API_BASE_URL = 'http://localhost:3000/api'

// Fetch all accounts
export const useAccounts = () => {
  return useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await axios.get<Account[]>(`${API_BASE_URL}/accounts`)
      return data
    },
  })
}

// Add new account
export const useAddAccount = () => {
  const queryClient = useQueryClient()
  
  return useMutation<Account, Error, BasicAccount>({
    mutationFn: async (newAccount: BasicAccount) => {
      const { data } = await axios.post<Account>(`${API_BASE_URL}/accounts`, newAccount)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

// Update account
export const useUpdateAccount = () => {
  const queryClient = useQueryClient()
  
  return useMutation<Account, Error, { id: string; data: BasicAccount }>({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put<Account>(`${API_BASE_URL}/accounts/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

// Delete account
export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE_URL}/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}