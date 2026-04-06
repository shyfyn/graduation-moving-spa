import type { PropsWithChildren } from 'react'

export const PageContainer = ({ children }: PropsWithChildren) => <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pb-28 pt-4">{children}</main>
