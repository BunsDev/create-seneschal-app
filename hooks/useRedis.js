import { useState } from 'react';

import axios from 'axios';

export const useRedis = () => {
  const [redisLoading, setRedisLoading] = useState(false);

  const setMeta = async (commitmentHash, ipfsHash) => {
    setRedisLoading(true);
    await axios.post('/api/set', { commitmentHash, ipfsHash });
    setRedisLoading(false);
  };

  const getMeta = async (commitmentHash) => {
    setRedisLoading(true);
    let { data } = await axios.post('/api/get', { commitmentHash });
    if (data.status === 'success') {
      setRedisLoading(false);
      return data.hash;
    } else {
      setRedisLoading(false);
    }
  };

  return {
    setMeta,
    getMeta,
    redisLoading
  };
};
