'use client';

import { Skeleton } from 'boneyard-js/react';

export default function Loading() {
  return <Skeleton name="home" loading={true}>{null}</Skeleton>;
}
