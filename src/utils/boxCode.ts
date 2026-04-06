export const suggestNextBoxCode = (boxCode: string, existingCodes: string[]) => {
  const match = boxCode.match(/^(.*?)(\d+)$/)
  if (!match) {
    let index = 2
    let next = `${boxCode}-02`
    while (existingCodes.includes(next)) {
      index += 1
      next = `${boxCode}-${String(index).padStart(2, '0')}`
    }
    return next
  }

  const [, prefix, digits] = match
  let index = Number(digits)
  let next = ''
  do {
    index += 1
    next = `${prefix}${String(index).padStart(digits.length, '0')}`
  } while (existingCodes.includes(next))
  return next
}
