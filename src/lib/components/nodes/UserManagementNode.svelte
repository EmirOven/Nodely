<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Users, Trash2, GripVertical, Check, X, UserPlus, LogIn, UserCheck, UserMinus, List } from '@lucide/svelte';
	import type { UserManagementData, UserActionType } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const userMgmtData = $derived(data as unknown as UserManagementData);
	const currentAction = $derived(userMgmtData.action || 'signup');

	const actions: { id: UserActionType; label: string; icon: any }[] = [
		{ id: 'signup', label: 'Sign Up', icon: UserPlus },
		{ id: 'login', label: 'Sign In', icon: LogIn },
		{ id: 'getUser', label: 'Get User', icon: UserCheck },
		{ id: 'updateUser', label: 'Update', icon: Users },
		{ id: 'deleteUser', label: 'Delete', icon: UserMinus },
		{ id: 'listUsers', label: 'List All', icon: List }
	];
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-indigo-500 hover:!bg-indigo-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
				<Users class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="User Management Node title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-indigo-500 max-w-[130px]"
				value={userMgmtData.title || 'User Management'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400">
				User Auth
			</span>
			<button
				type="button"
				class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-rose-400 transition"
				onclick={() => deleteElements({ nodes: [{ id }] })}
				title="Delete Node"
			>
				<Trash2 class="h-3.5 w-3.5" />
			</button>
		</div>
	</div>

	<!-- Content -->
	<div class="p-3 space-y-3">
		<!-- Action Buttons Grid -->
		<div class="space-y-1">
			<label for="action-grid-{id}" class="text-[11px] font-medium text-slate-400">Auth Action</label>
			<div class="grid grid-cols-3 gap-1.5">
				{#each actions as a}
					<button
						type="button"
						onclick={() => updateNodeData(id, { action: a.id })}
						class="flex items-center justify-center gap-1 rounded-lg border py-1.5 text-[10px] font-medium transition {currentAction === a.id
							? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300 shadow-sm'
							: 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}"
					>
						<span>{a.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Action-specific expression inputs -->
		{#if currentAction === 'signup' || currentAction === 'login'}
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1">
					<label for="email-expr-{id}" class="text-[10px] font-medium text-slate-400">Email Expression</label>
					<input
						id="email-expr-{id}"
						type="text"
						class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
						placeholder="payload.email"
						value={userMgmtData.emailExpr ?? 'payload.email'}
						oninput={(e) => updateNodeData(id, { emailExpr: (e.target as HTMLInputElement).value })}
					/>
				</div>
				<div class="space-y-1">
					<label for="pwd-expr-{id}" class="text-[10px] font-medium text-slate-400">Password Expr</label>
					<input
						id="pwd-expr-{id}"
						type="text"
						class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
						placeholder="payload.password"
						value={userMgmtData.passwordExpr ?? 'payload.password'}
						oninput={(e) => updateNodeData(id, { passwordExpr: (e.target as HTMLInputElement).value })}
					/>
				</div>
			</div>
		{/if}

		{#if currentAction === 'signup'}
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1">
					<label for="name-expr-{id}" class="text-[10px] font-medium text-slate-400">Name Expression</label>
					<input
						id="name-expr-{id}"
						type="text"
						class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
						placeholder="payload.name"
						value={userMgmtData.nameExpr ?? 'payload.name'}
						oninput={(e) => updateNodeData(id, { nameExpr: (e.target as HTMLInputElement).value })}
					/>
				</div>
				<div class="space-y-1">
					<label for="role-expr-{id}" class="text-[10px] font-medium text-slate-400">Default Role</label>
					<input
						id="role-expr-{id}"
						type="text"
						class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
						placeholder="user"
						value={userMgmtData.role ?? 'user'}
						oninput={(e) => updateNodeData(id, { role: (e.target as HTMLInputElement).value })}
					/>
				</div>
			</div>
		{/if}

		{#if currentAction === 'getUser' || currentAction === 'deleteUser' || currentAction === 'updateUser'}
			<div class="space-y-1">
				<label for="user-id-{id}" class="text-[10px] font-medium text-slate-400">User ID Expression</label>
				<input
					id="user-id-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
					placeholder="payload.userId or headers.authorization"
					value={userMgmtData.userIdExpr ?? 'payload.userId'}
					oninput={(e) => updateNodeData(id, { userIdExpr: (e.target as HTMLInputElement).value })}
				/>
			</div>
		{/if}

		<!-- Info Note -->
		<div class="rounded-lg bg-slate-950/80 p-2 text-[10px] text-slate-400 border border-slate-800/80 flex items-center justify-between">
			<span>Injects: <code class="text-indigo-300 font-mono">state.user</code></span>
			<span class="text-slate-500 font-mono">sessionToken</span>
		</div>
	</div>

	<!-- Output Branches -->
	<div class="border-t border-slate-800/80 bg-slate-950/40 px-3 py-2.5 rounded-b-xl flex items-center justify-between">
		<!-- Success Branch -->
		<div class="flex items-center gap-1.5 relative">
			<div class="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
				<Check class="h-2.5 w-2.5" />
			</div>
			<span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">SUCCESS</span>
			<Handle
				type="source"
				position={Position.Bottom}
				id="success"
				class="!left-4 !bottom-[-10px] !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
			/>
		</div>

		<!-- Error Branch -->
		<div class="flex items-center gap-1.5 relative">
			<span class="text-[10px] font-bold text-rose-400 uppercase tracking-wider">ERROR</span>
			<div class="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
				<X class="h-2.5 w-2.5" />
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				id="error"
				class="!right-4 !bottom-[-10px] !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-rose-500 hover:!bg-rose-400 transition"
			/>
		</div>
	</div>
</div>
