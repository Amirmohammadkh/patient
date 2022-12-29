import { searchClient } from '@/common/apis/client';
import { ServerStateKeysEnum } from '@/common/apis/serverStateKeysEnum';
import { useUniversity } from '@/common/hooks/useUniversity';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useQuery } from 'react-query';

export interface Params {
  query?: ParsedUrlQuery;
  route: string;
  headers?: any;
}

export const search = async ({ route, query, headers }: Params) => {
  const { data } = await searchClient.get(`/seapi/v1/search/${encodeURIComponent(route)}`, {
    params: {
      ...query,
    },
    headers,
  });
  return data;
};

export const useSearch = () => {
  const {
    query: { params, ...query },
  } = useRouter();
  const university = useUniversity();

  const searchParams = {
    route: (params as string[])?.join('/') ?? '',
    query: {
      ...query,
      ...(university && { university }),
    },
  };

  return useQuery([ServerStateKeysEnum.Search, searchParams], () => search(searchParams), {
    keepPreviousData: true,
    refetchOnMount: false,
  });
};
