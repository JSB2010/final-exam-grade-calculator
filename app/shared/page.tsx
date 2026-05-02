import { SharedImport } from "@/components/shared-import"

type SharedPageProps = {
  searchParams?: {
    data?: string
  }
}

export default function SharedPage({ searchParams }: SharedPageProps) {
  return <SharedImport encodedData={searchParams?.data} />
}
