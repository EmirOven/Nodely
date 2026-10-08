<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Network,
		Users,
		UserPlus,
		Search,
		Trash2,
		ShieldCheck,
		Mail,
		KeyRound,
		Ban,
		CheckCircle2,
		ArrowLeft,
		RefreshCw,
		SlidersHorizontal,
		Plus,
		X,
		Check,
		Edit2,
		ExternalLink
	} from '@lucide/svelte';
	import GoogleIcon from '../../lib/components/icons/GoogleIcon.svelte';
	import type { ProjectUser } from '../../lib/server/userStore';

	let users = $state<ProjectUser[]>([]);
	let isLoading = $state(true);
	let searchQuery = $state('');
	let selectedProvider = $state<'ALL' | 'email' | 'google'>('ALL');
	let selectedStatus = $state<'ALL' | 'active' | 'banned'>('ALL');

	// Create User Modal state
	let isCreateModalOpen = $state(false);
	let newEmail = $state('');
	let newPassword = $state('');
	let newName = $state('');
	let newRole = $state('user');
	let newProvider = $state<'email' | 'google'>('email');
	let createError = $state<string | null>(null);
	let isCreating = $state(false);

	// Edit User Modal state
	let isEditModalOpen = $state(false);
	let editingUser = $state<ProjectUser | null>(null);
	let editName = $state('');
	let editRole = $state('user');
	let editPassword = $state('');
	let isEditing = $state(false);

	// Delete Modal state
	let isDeleteModalOpen = $state(false);
	let userToDelete = $state<ProjectUser | null>(null);

	async function loadUsers() {
		isLoading = true;
		try {
			const res = await fetch('/api/users');
			if (res.ok) {
				const data = await res.json();
				users = data.users || [];
			}
		} catch (e) {
			console.error('Failed to load users:', e);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadUsers();
	});

	const filteredUsers = $derived(
		users.filter((u) => {
			const matchesSearch =
				u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.id.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesProvider = selectedProvider === 'ALL' || u.provider === selectedProvider;

			const matchesStatus =
				selectedStatus === 'ALL' ||
				(selectedStatus === 'active' && !u.isBanned) ||
				(selectedStatus === 'banned' && u.isBanned);

			return matchesSearch && matchesProvider && matchesStatus;
		})
	);

	const stats = $derived({
		total: users.length,
		active: users.filter((u) => !u.isBanned).length,
		google: users.filter((u) => u.provider === 'google').length,
		banned: users.filter((u) => u.isBanned).length
	});

	async function handleCreateUser() {
		if (!newEmail.trim()) {
			createError = 'Email address is required';
			return;
		}

		isCreating = true;
		createError = null;

		try {
			const res = await fetch('/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: newEmail.trim(),
					password: newPassword ? newPassword : undefined,
					name: newName.trim(),
					role: newRole,
					provider: newProvider
				})
			});

			const data = await res.json();
			if (res.ok) {
				users = [data.user, ...users];
				isCreateModalOpen = false;
				newEmail = '';
				newPassword = '';
				newName = '';
				newRole = 'user';
			} else {
				createError = data.error || 'Failed to create user';
			}
		} catch (e: any) {
			createError = e.message || 'Network request failed';
		} finally {
			isCreating = false;
		}
	}

	function openEditModal(u: ProjectUser) {
		editingUser = u;
		editName = u.name;
		editRole = u.role;
		editPassword = '';
		isEditModalOpen = true;
	}

	async function handleSaveEdit() {
		if (!editingUser) return;
		isEditing = true;

		try {
			const body: any = {
				name: editName.trim(),
				role: editRole
			};
			if (editPassword) {
				body.password = editPassword;
			}

			const res = await fetch(`/api/users/${editingUser.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (res.ok) {
				const data = await res.json();
				users = users.map((u) => (u.id === editingUser?.id ? data.user : u));
				isEditModalOpen = false;
				editingUser = null;
			}
		} catch (e) {
			console.error('Failed to update user:', e);
		} finally {
			isEditing = false;
		}
	}

	async function toggleBan(user: ProjectUser) {
		try {
			const res = await fetch(`/api/users/${user.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isBanned: !user.isBanned })
			});
			if (res.ok) {
				const data = await res.json();
				users = users.map((u) => (u.id === user.id ? data.user : u));
			}
		} catch (e) {
			console.error('Failed to toggle ban status:', e);
		}
	}

	function confirmDelete(user: ProjectUser) {
		userToDelete = user;
		isDeleteModalOpen = true;
	}

	async function handleDeleteUser() {
		if (!userToDelete) return;
		try {
			const res = await fetch(`/api/users/${userToDelete.id}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				users = users.filter((u) => u.id !== userToDelete?.id);
				isDeleteModalOpen = false;
				userToDelete = null;
			}
		} catch (e) {
			console.error('Failed to delete user:', e);
		}
	}

	function formatDate(dateStr?: string): string {
		if (!dateStr) return 'Never';
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
		} catch {
			return dateStr;
		}
	}
</script>

<svelte:head>
	<title>Project Users & Auth — Nodely</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
	<!-- Top Navigation -->
	<header
		class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur-xl"
	>
		<!-- Left: Brand & Return -->
		<div class="flex items-center gap-4">
			<a
				href="/"
				class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition group"
				title="Back to All Nodeflows"
			>
				<ArrowLeft class="h-3.5 w-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
				<span>Nodeflows</span>
			</a>

			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 text-white"
				>
					<Network class="h-5 w-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-base font-bold tracking-tight text-white">Project Users</h1>
						<span
							class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20"
						>
							v0.4.1
						</span>
					</div>
					<p class="text-xs text-slate-400">Nodeflow Auth Database & User Directory</p>
				</div>
			</div>
		</div>

		<!-- Center: Navigation Tabs -->
		<div class="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
			<a href="/" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				Nodeflows
			</a>
			<a href="/users" class="px-3 py-1 text-xs font-semibold text-white bg-slate-800 rounded-lg shadow-sm">
				Project Users
			</a>
			<a href="/settings" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				Settings
			</a>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={loadUsers}
				class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
				title="Refresh user list"
			>
				<RefreshCw class="h-3.5 w-3.5 {isLoading ? 'animate-spin' : ''}" />
				<span>Refresh</span>
			</button>

			<button
				type="button"
				onclick={() => {
					newEmail = '';
					newPassword = '';
					newName = '';
					newRole = 'user';
					newProvider = 'email';
					createError = null;
					isCreateModalOpen = true;
				}}
				class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/60 hover:from-indigo-500 hover:to-purple-500 transition active:scale-95"
			>
				<UserPlus class="h-4 w-4" />
				<span>Create User</span>
			</button>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
			<div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-slate-400 text-xs font-medium">
					<span>Total Users</span>
					<Users class="h-4 w-4 text-indigo-400" />
				</div>
				<div class="mt-2 text-2xl font-bold text-white">{stats.total}</div>
				<p class="mt-1 text-[11px] text-slate-500">Registered across all Nodeflows</p>
			</div>

			<div class="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-emerald-400 text-xs font-medium">
					<span>Active Users</span>
					<CheckCircle2 class="h-4 w-4 text-emerald-400" />
				</div>
				<div class="mt-2 text-2xl font-bold text-emerald-400">{stats.active}</div>
				<p class="mt-1 text-[11px] text-emerald-500/80">Can authenticate & request tokens</p>
			</div>

			<div class="rounded-2xl border border-red-500/20 bg-red-950/10 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-slate-300 text-xs font-medium">
					<span>Google OAuth</span>
					<GoogleIcon class="h-4 w-4" />
				</div>
				<div class="mt-2 text-2xl font-bold text-red-400">{stats.google}</div>
				<p class="mt-1 text-[11px] text-red-500/80">Authenticated via Google Auth node</p>
			</div>

			<div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-slate-400 text-xs font-medium">
					<span>Suspended / Banned</span>
					<Ban class="h-4 w-4 text-rose-400" />
				</div>
				<div class="mt-2 text-2xl font-bold text-rose-400">{stats.banned}</div>
				<p class="mt-1 text-[11px] text-slate-500">Blocked from login nodes</p>
			</div>
		</div>

		<!-- Filters & Search -->
		<div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
			<!-- Search -->
			<div class="relative flex-1 max-w-md">
				<Search class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
				<input
					type="text"
					placeholder="Search users by name, email, or user ID..."
					bind:value={searchQuery}
					class="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-3 text-slate-500 hover:text-white"
					>
						<X class="h-3.5 w-3.5" />
					</button>
				{/if}
			</div>

			<!-- Provider Filter -->
			<div class="flex items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-900/60">
				<button
					type="button"
					onclick={() => (selectedProvider = 'ALL')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedProvider === 'ALL'
						? 'bg-slate-700 text-white'
						: 'text-slate-400 hover:text-slate-200'}"
				>
					All Providers
				</button>
				<button
					type="button"
					onclick={() => (selectedProvider = 'email')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedProvider === 'email'
						? 'bg-indigo-600 text-white'
						: 'text-slate-400 hover:text-indigo-400'}"
				>
					Email
				</button>
				<button
					type="button"
					onclick={() => (selectedProvider = 'google')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedProvider === 'google'
						? 'bg-red-600 text-white'
						: 'text-slate-400 hover:text-red-400'}"
				>
					Google
				</button>
			</div>

			<!-- Status Filter -->
			<div class="flex items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-900/60">
				<button
					type="button"
					onclick={() => (selectedStatus = 'ALL')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedStatus === 'ALL'
						? 'bg-slate-700 text-white'
						: 'text-slate-400 hover:text-slate-200'}"
				>
					All Status
				</button>
				<button
					type="button"
					onclick={() => (selectedStatus = 'active')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedStatus === 'active'
						? 'bg-emerald-600 text-white'
						: 'text-slate-400 hover:text-emerald-400'}"
				>
					Active
				</button>
				<button
					type="button"
					onclick={() => (selectedStatus = 'banned')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedStatus === 'banned'
						? 'bg-rose-600 text-white'
						: 'text-slate-400 hover:text-rose-400'}"
				>
					Banned
				</button>
			</div>
		</div>

		<!-- Users Table -->
		<div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse text-xs">
					<thead>
						<tr class="border-b border-slate-800/80 bg-slate-900/70 text-slate-400 font-semibold">
							<th class="p-4">User</th>
							<th class="p-4">Provider</th>
							<th class="p-4">Role</th>
							<th class="p-4">Created</th>
							<th class="p-4">Last Sign In</th>
							<th class="p-4">Status</th>
							<th class="p-4 text-right">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/60 text-slate-300">
						{#each filteredUsers as user (user.id)}
							<tr class="hover:bg-slate-900/60 transition-colors">
								<!-- User Avatar & Info -->
								<td class="p-4">
									<div class="flex items-center gap-3">
										<div class="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/20 overflow-hidden">
											{#if user.avatarUrl}
												<img src={user.avatarUrl} alt={user.name} class="h-full w-full object-cover" />
											{:else}
												{user.name.charAt(0) || user.email.charAt(0)}
											{/if}
										</div>
										<div>
											<div class="font-bold text-white flex items-center gap-1.5">
												<span>{user.name}</span>
												{#if user.isEmailVerified}
													<CheckCircle2 class="h-3 w-3 text-emerald-400" title="Email Verified" />
												{/if}
											</div>
											<div class="text-[11px] text-slate-400 font-mono">{user.email}</div>
										</div>
									</div>
								</td>

								<!-- Provider -->
								<td class="p-4">
									{#if user.provider === 'google'}
										<span class="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-200 border border-slate-700">
											<GoogleIcon class="h-3 w-3" />
											Google
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
											<Mail class="h-3 w-3" />
											Email/Password
										</span>
									{/if}
								</td>

								<!-- Role -->
								<td class="p-4">
									<span class="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-300 border border-slate-700">
										{user.role}
									</span>
								</td>

								<!-- Created -->
								<td class="p-4 text-slate-400 text-[11px]">
									{formatDate(user.createdAt)}
								</td>

								<!-- Last Sign In -->
								<td class="p-4 text-slate-400 text-[11px]">
									{formatDate(user.lastSignInAt)}
								</td>

								<!-- Status -->
								<td class="p-4">
									{#if user.isBanned}
										<span class="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
											Banned
										</span>
									{:else}
										<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
											Active
										</span>
									{/if}
								</td>

								<!-- Actions -->
								<td class="p-4 text-right">
									<div class="flex items-center justify-end gap-1.5">
										<button
											type="button"
											onclick={() => openEditModal(user)}
											class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
											title="Edit User"
										>
											<Edit2 class="h-3.5 w-3.5" />
										</button>

										<button
											type="button"
											onclick={() => toggleBan(user)}
											class="rounded-lg p-1.5 transition {user.isBanned
												? 'text-emerald-400 hover:bg-emerald-500/10'
												: 'text-amber-400 hover:bg-amber-500/10'}"
											title={user.isBanned ? 'Unban User' : 'Ban User'}
										>
											<Ban class="h-3.5 w-3.5" />
										</button>

										<button
											type="button"
											onclick={() => confirmDelete(user)}
											class="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
											title="Delete User"
										>
											<Trash2 class="h-3.5 w-3.5" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				{#if filteredUsers.length === 0 && !isLoading}
					<div class="p-12 text-center text-slate-500 space-y-2">
						<Users class="h-8 w-8 mx-auto text-slate-600" />
						<div class="text-sm font-semibold text-slate-400">No matching users found</div>
						<p class="text-xs">Create users via visual nodeflows or click "Create User" above.</p>
					</div>
				{/if}
			</div>
		</div>
	</main>

	<!-- Create User Modal -->
	{#if isCreateModalOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-100">
			<div class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-100">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-2.5">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
							<UserPlus class="h-4 w-4" />
						</div>
						<div>
							<h3 class="text-sm font-bold text-white">Add Project User</h3>
							<p class="text-[11px] text-slate-400">Manually provision a user for node authentication</p>
						</div>
					</div>
					<button type="button" onclick={() => (isCreateModalOpen = false)} class="text-slate-500 hover:text-white">
						<X class="h-4 w-4" />
					</button>
				</div>

				{#if createError}
					<div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
						{createError}
					</div>
				{/if}

				<form onsubmit={(e) => { e.preventDefault(); handleCreateUser(); }} class="space-y-4">
					<div class="space-y-1">
						<label for="modal-email" class="text-xs font-medium text-slate-300">Email Address *</label>
						<input
							id="modal-email"
							type="email"
							required
							placeholder="user@example.com"
							bind:value={newEmail}
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
						/>
					</div>

					<div class="space-y-1">
						<label for="modal-name" class="text-xs font-medium text-slate-300">Full Name</label>
						<input
							id="modal-name"
							type="text"
							placeholder="Alex Smith"
							bind:value={newName}
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
						/>
					</div>

					<div class="space-y-1">
						<label for="modal-pwd" class="text-xs font-medium text-slate-300">Password</label>
						<input
							id="modal-pwd"
							type="password"
							placeholder="Leave empty for OAuth or enter password"
							bind:value={newPassword}
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1">
							<label for="modal-role" class="text-xs font-medium text-slate-300">Role</label>
							<select
								id="modal-role"
								bind:value={newRole}
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
							>
								<option value="user">user</option>
								<option value="admin">admin</option>
								<option value="editor">editor</option>
							</select>
						</div>

						<div class="space-y-1">
							<label for="modal-prov" class="text-xs font-medium text-slate-300">Provider</label>
							<select
								id="modal-prov"
								bind:value={newProvider}
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
							>
								<option value="email">Email</option>
								<option value="google">Google</option>
							</select>
						</div>
					</div>

					<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
						<button
							type="button"
							onclick={() => (isCreateModalOpen = false)}
							class="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isCreating}
							class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
						>
							{#if isCreating}
								<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
								<span>Creating...</span>
							{:else}
								<span>Create User</span>
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Edit User Modal -->
	{#if isEditModalOpen && editingUser}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-100">
			<div class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-100">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<h3 class="text-sm font-bold text-white">Edit User: {editingUser.email}</h3>
					<button type="button" onclick={() => (isEditModalOpen = false)} class="text-slate-500 hover:text-white">
						<X class="h-4 w-4" />
					</button>
				</div>

				<form onsubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} class="space-y-4">
					<div class="space-y-1">
						<label for="edit-name" class="text-xs font-medium text-slate-300">Name</label>
						<input
							id="edit-name"
							type="text"
							bind:value={editName}
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
						/>
					</div>

					<div class="space-y-1">
						<label for="edit-role" class="text-xs font-medium text-slate-300">Role</label>
						<select
							id="edit-role"
							bind:value={editRole}
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
						>
							<option value="user">user</option>
							<option value="admin">admin</option>
							<option value="editor">editor</option>
						</select>
					</div>

					<div class="space-y-1">
						<label for="edit-pwd" class="text-xs font-medium text-slate-300">Reset Password (Optional)</label>
						<input
							id="edit-pwd"
							type="password"
							placeholder="Enter new password or leave blank"
							bind:value={editPassword}
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
						/>
					</div>

					<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
						<button
							type="button"
							onclick={() => (isEditModalOpen = false)}
							class="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isEditing}
							class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
						>
							{#if isEditing}
								<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
								<span>Saving...</span>
							{:else}
								<span>Save Changes</span>
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Delete Confirmation Modal -->
	{#if isDeleteModalOpen && userToDelete}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-100">
			<div class="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-100">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
						<Trash2 class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-white">Delete User?</h3>
						<p class="text-[11px] text-slate-400">{userToDelete.email}</p>
					</div>
				</div>
				<p class="text-xs text-slate-400">
					This user will be permanently removed from your project auth store. Nodeflows attempting to authenticate this user will fail.
				</p>
				<div class="flex items-center justify-end gap-2.5 pt-2">
					<button
						type="button"
						onclick={() => (isDeleteModalOpen = false)}
						class="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleDeleteUser}
						class="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500"
					>
						Delete Permanently
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
