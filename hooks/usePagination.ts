"use client"

import { useState } from "react"

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  function onPageSizeChange(size: number) {
    setPageSize(size)
    setPage(1)
  }

  return {
    page,
    pageSize,
    setPage,
    setPageSize: onPageSizeChange,
  }
}
