"use client"
import React, { useEffect, useRef } from 'react'
import { UserPlus, CheckSquare, LogOut } from 'lucide-react'

type Props = { isOpen: boolean; onClose: () => void }

export default function MeneModal({ isOpen, onClose }: Props) {
	const ref = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		function handle(e: MouseEvent) {
			if (!ref.current) return
			if (e.target instanceof Node && !ref.current.contains(e.target)) {
				onClose()
			}
		}

		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose()
		}

		if (isOpen) {
			document.addEventListener('mousedown', handle)
			document.addEventListener('keydown', onKey)
		}
		return () => {
			document.removeEventListener('mousedown', handle)
			document.removeEventListener('keydown', onKey)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div
			ref={ref}
			role="menu"
			aria-orientation="vertical"
			className="absolute top-14 left-0 z-50 w-44 bg-[#FFF9F3] rounded-md shadow-lg select-none"
			style={{ border: '1px solid rgba(59,130,246,0.22)' }}
		>
			<div className="flex flex-col">
				<button
					type="button"
					className="w-full flex items-center gap-3 px-3 py-3  hover:bg-blue-50 focus:outline-none"
				>
					<div className="w-7 h-7 flex items-center justify-center rounded-md">
						<UserPlus className="w-5 h-5 text-gray-700" />
					</div>
					<span className="text-base font-medium text-gray-800">New group</span>
				</button>

				<button type="button" className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50">
					<div className="w-7 h-7 flex items-center justify-center rounded-md">
						<CheckSquare className="w-5 h-5 text-gray-700" />
					</div>
					<span className="text-sm text-gray-700">Select chats</span>
				</button>

				<button
					type="button"
					onClick={onClose}
					className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50"
				>
					<div className="w-7 h-7 flex items-center justify-center rounded-md">
						<LogOut className="w-5 h-5 text-gray-700" />
					</div>
					<span className="text-sm text-gray-700">Log out</span>
				</button>
			</div>
		</div>
	)
}
