// utils/sanityClient.js
import { createClient } from '@sanity/client';

export const cdnClient = createClient({
  projectId: '2dnm6wwp',
  dataset: 'butterfly-habits',
  apiVersion: '2022-03-07',
  useCdn: true, // cached & fast
  token: process.env.REACT_APP_SANITY_TOKEN, 
});

export const liveClient = createClient({
  projectId: '2dnm6wwp',
  dataset: 'butterfly-habits',
  apiVersion: '2022-03-07',
  useCdn: false,                   
  token: process.env.REACT_APP_SANITY_TOKEN,
});

export default cdnClient;
