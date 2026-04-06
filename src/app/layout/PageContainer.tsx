import type { PropsWithChildren } from 'react'

export const PageContainer = ({ children }: PropsWithChildren) => <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 pb-32 pt-5">{children}</main>
