import { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { test, expect } from 'vitest'

export async function BaseTest(componet: ReactNode, desc: string) {
  test(desc, async () => {
    render(componet)
    const changeNameBtn = screen.getByText('change name')
    const [parentNameContent, childNameContent] =
      screen.queryAllByText(/name:.*/)

    expect(parentNameContent.textContent).toBe('name: foo')
    expect(childNameContent.textContent).toBe('name: foo')
    await userEvent.click(changeNameBtn)
    expect(parentNameContent.textContent).toBe('name: foo-')
    expect(childNameContent.textContent).toBe('name: foo-')
    await userEvent.click(changeNameBtn)
    expect(parentNameContent.textContent).toBe('name: foo--')
    expect(childNameContent.textContent).toBe('name: foo--')

    const changeAgeBtn = screen.getByText('change age')
    const ageContent = screen.getByText(/age:[\d]*/)

    expect(ageContent.textContent).toBe('age: 21')
    await userEvent.click(changeAgeBtn)
    expect(ageContent.textContent).toBe('age: 22')
    await userEvent.click(changeAgeBtn)
    expect(ageContent.textContent).toBe('age: 23')
  })
}
