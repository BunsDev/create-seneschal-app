'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { MoreHorizontal, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { formatEther } from 'viem';

import { useQuery } from '@apollo/client';

import { GetProposals } from '@/graphql/queries';

import { useState } from 'react';

import { getAccountString } from '@/lib/helpers';
import { EXPLORER_BASE_URL, IPFS_BASE_GATEWAY } from '@/config';

const columns = [
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'sponsor',
    header: 'Sponsor',
    cell: ({ row }) => {
      return (
        <div
          className='flex flex-row items-center cursor-pointer underline'
          onClick={() =>
            window.open(
              `${EXPLORER_BASE_URL}/address/${row.original['sponsor']}`,
              '_blank'
            )
          }
        >
          <p className='mr-2'>{getAccountString(row.original['sponsor'])}</p>
          <ExternalLink className='w-4 h-4' />
        </div>
      );
    }
  },
  {
    accessorKey: 'witness',
    header: 'Witness',
    cell: ({ row }) => {
      return row.original['witness'] ? (
        <div
          className='flex flex-row items-center cursor-pointer underline'
          onClick={() =>
            window.open(
              `${EXPLORER_BASE_URL}/address/${row.original['witness']}`,
              '_blank'
            )
          }
        >
          <p className='mr-2'>{getAccountString(row.original['witness'])}</p>
          <ExternalLink className='w-4 h-4' />
        </div>
      ) : (
        <p>Not witnessed yet.</p>
      );
    }
  },
  {
    accessorKey: 'recipient',
    header: 'Recipient',
    cell: ({ row }) => {
      return (
        <div
          className='flex flex-row items-center cursor-pointer underline'
          onClick={() =>
            window.open(
              `${EXPLORER_BASE_URL}/address/${row.original['recipient']}`,
              '_blank'
            )
          }
        >
          <p className='mr-2'>{getAccountString(row.original['recipient'])}</p>
          <ExternalLink className='w-4 h-4' />
        </div>
      );
    }
  },
  {
    accessorKey: 'loot',
    header: 'Loot',
    cell: ({ row }) => {
      let loot = formatEther(row.original['loot']);
      return <p>{loot}</p>;
    }
  },
  {
    id: 'actions',
    header: 'Links',
    cell: ({ row }) => {
      const proposal = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => window.open(proposal.contextURL, '_blank')}
            >
              View mirror proposal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `${IPFS_BASE_GATEWAY}/${proposal.metadata}`,
                  '_blank'
                )
              }
            >
              View summary
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export const Proposals = () => {
  const [proposals, setProposals] = useState([]);

  const { refetch } = useQuery(GetProposals, {
    onCompleted: (data) => {
      let _proposals = data.proposals;
      let formattedProposals = [];
      _proposals.forEach((proposal) => {
        formattedProposals.push({
          sponsor: proposal.sponsor,
          witness: proposal.witness,
          recipient: proposal.recipient,
          status: proposal.status,
          loot: proposal.commitmentDetails.loot,
          contextURL: proposal.commitmentDetails.contextURL,
          metadata: proposal.commitmentDetails.metadata
        });
      });
      setProposals(formattedProposals);
    }
  });

  const table = useReactTable({
    data: proposals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className='w-full'>
      <h4 className='scroll-m-20 text-xl font-semibold tracking-tight mb-2'>
        Proposals
      </h4>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
