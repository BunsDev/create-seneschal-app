import { useState } from 'react';

import axios from 'axios';

export const useRedis = () => {
  const [redisLoading, setRedisLoading] = useState(false);
  const [redisHash, setRedisHash] = useState('');

  const setMeta = async (commitmentHash, ipfsHash) => {
    setRedisLoading(true);
    await axios.post('/api/set', { commitmentHash, ipfsHash });
    setRedisLoading(false);
  };

  const getMeta = async (commitmentHash) => {
    setRedisLoading(true);
    let { data } = await axios.post('/api/get', { commitmentHash });
    if (data.status === 'success') {
      setRedisHash(data.hash);
    }
    setRedisLoading(false);
  };

  return {
    setMeta,
    getMeta,
    redisLoading,
    redisHash
  };
};
