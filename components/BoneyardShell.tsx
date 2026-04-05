'use client';

import { Skeleton } from 'boneyard-js/react';

export default function BoneyardShell({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <Skeleton name={name} loading={false}>
      {children}
    </Skeleton>
  );
}
