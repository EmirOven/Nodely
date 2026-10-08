<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Users, UserPlus, LogIn, UserCheck, UserMinus, List } from '@lucide/svelte';
	import type { UserManagementData, UserActionType } from '../../types';
	import BaseNode, { type OutputHandleConfig } from './BaseNode.svelte';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

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

	const outputs: OutputHandleConfig[] = [
		{ id: 'success', label: 'SUCCESS', color: 'emerald' },
		{ id: 'error', label: 'ERROR', color: 'rose' }
	];
</script>

<BaseNode
	{id}
	nodeType="userManagementNode"
	{selected}
	title={userMgmtData.title || 'User Management'}
	accentColor="indigo"
	icon={Users}
	badge="User Auth"
	width="w-80"
	{outputs}
	onTitleChange={(title) => updateNodeData(id, { title })}
>
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
</BaseNode>
