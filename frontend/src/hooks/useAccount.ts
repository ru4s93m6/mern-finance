// hooks/useAccount.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Account, BasicAccount, TransferData, TransferResponse } from '@/types/account'

// Fetch all accounts
export const useAccounts = () => {
  return useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get<Account[]>('/accounts')
      return data
    },
  })
}

// Add new account
export const useAddAccount = () => {
  const queryClient = useQueryClient()

  return useMutation<Account, Error, BasicAccount>({
    mutationFn: async (newAccount: BasicAccount) => {
      const { data } = await api.post<Account>('/accounts', newAccount)
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
      const response = await api.put<Account>(`/accounts/${id}`, data)
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
      await api.delete(`/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

// Transfer funds between accounts
export const useTransferAccount = () => {
  const queryClient = useQueryClient()

  return useMutation<TransferResponse, Error, TransferData>({
    mutationFn: async (transferData: TransferData) => {
      const { data } = await api.post<TransferResponse>(
        '/accounts/transfer',
        transferData
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}