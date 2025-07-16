import { API, graphqlOperation } from 'aws-amplify';

// Optimized GraphQL queries for the marketplace
export const listListingsWithFilters = /* GraphQL */ `
  query ListListings(
    $filter: ModelListingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listListings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        price
        images
        status
        condition
        brand
        model
        location
        city
        state
        viewCount
        createdAt
        user {
          id
          firstName
          lastName
          profileImageUrl
        }
        category {
          id
          name
          slug
        }
      }
      nextToken
    }
  }
`;

export const getListingWithDetails = /* GraphQL */ `
  query GetListing($id: ID!) {
    getListing(id: $id) {
      id
      title
      description
      price
      images
      status
      condition
      brand
      model
      size
      color
      location
      city
      state
      zipCode
      latitude
      longitude
      viewCount
      createdAt
      updatedAt
      user {
        id
        email
        firstName
        lastName
        profileImageUrl
      }
      category {
        id
        name
        slug
        description
      }
      comments {
        items {
          id
          content
          createdAt
          user {
            id
            firstName
            lastName
            profileImageUrl
          }
          replies {
            items {
              id
              content
              createdAt
              user {
                id
                firstName
                lastName
                profileImageUrl
              }
            }
          }
        }
      }
    }
  }
`;

export const listCategoriesWithCounts = /* GraphQL */ `
  query ListCategories {
    listCategories {
      items {
        id
        name
        slug
        description
        createdAt
        listings {
          items {
            id
            status
          }
        }
      }
    }
  }
`;

export const getUserMessages = /* GraphQL */ `
  query GetUserMessages($userId: ID!) {
    listMessages(filter: { 
      or: [
        { senderId: { eq: $userId } },
        { receiverId: { eq: $userId } }
      ]
    }) {
      items {
        id
        content
        isRead
        senderId
        receiverId
        listingId
        createdAt
        sender {
          id
          firstName
          lastName
          profileImageUrl
        }
        receiver {
          id
          firstName
          lastName
          profileImageUrl
        }
        listing {
          id
          title
          images
          price
        }
      }
    }
  }
`;

export const searchListings = /* GraphQL */ `
  query SearchListings(
    $searchTerm: String
    $categoryId: ID
    $minPrice: Float
    $maxPrice: Float
    $city: String
    $state: String
    $condition: String
    $limit: Int
    $nextToken: String
  ) {
    listListings(
      filter: {
        and: [
          { status: { eq: "active" } }
          { title: { contains: $searchTerm } }
          { categoryId: { eq: $categoryId } }
          { price: { ge: $minPrice } }
          { price: { le: $maxPrice } }
          { city: { eq: $city } }
          { state: { eq: $state } }
          { condition: { eq: $condition } }
        ]
      }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        description
        price
        images
        condition
        location
        city
        state
        viewCount
        createdAt
        user {
          id
          firstName
          lastName
          profileImageUrl
        }
        category {
          id
          name
          slug
        }
      }
      nextToken
    }
  }
`;

export const getForumPostsWithComments = /* GraphQL */ `
  query ListForumPosts(
    $filter: ModelForumPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listForumPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        viewCount
        createdAt
        user {
          id
          firstName
          lastName
          profileImageUrl
        }
        category {
          id
          name
          slug
        }
        comments {
          items {
            id
            content
            createdAt
            user {
              id
              firstName
              lastName
              profileImageUrl
            }
          }
        }
      }
      nextToken
    }
  }
`;

// Subscription queries for real-time features
export const onCreateMessageSubscription = /* GraphQL */ `
  subscription OnCreateMessage($receiverId: ID!) {
    onCreateMessage(receiverId: $receiverId) {
      id
      content
      isRead
      senderId
      receiverId
      listingId
      createdAt
      sender {
        id
        firstName
        lastName
        profileImageUrl
      }
      listing {
        id
        title
        images
      }
    }
  }
`;

export const onCreateCommentSubscription = /* GraphQL */ `
  subscription OnCreateComment($listingId: ID, $forumPostId: ID) {
    onCreateComment(listingId: $listingId, forumPostId: $forumPostId) {
      id
      content
      listingId
      forumPostId
      createdAt
      user {
        id
        firstName
        lastName
        profileImageUrl
      }
    }
  }
`;

// API helper functions
export const fetchListingsWithFilters = async (filter = {}, limit = 20, nextToken = null) => {
  try {
    const result = await API.graphql(
      graphqlOperation(listListingsWithFilters, { filter, limit, nextToken })
    );
    return result.data.listListings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const fetchListingDetails = async (id) => {
  try {
    const result = await API.graphql(graphqlOperation(getListingWithDetails, { id }));
    return result.data.getListing;
  } catch (error) {
    console.error('Error fetching listing details:', error);
    throw error;
  }
};

export const fetchCategoriesWithCounts = async () => {
  try {
    const result = await API.graphql(graphqlOperation(listCategoriesWithCounts));
    return result.data.listCategories.items.map(category => ({
      ...category,
      count: category.listings.items.filter(listing => listing.status === 'active').length
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const searchListingsWithFilters = async (filters) => {
  try {
    const result = await API.graphql(
      graphqlOperation(searchListings, filters)
    );
    return result.data.listListings;
  } catch (error) {
    console.error('Error searching listings:', error);
    throw error;
  }
};

export const fetchUserMessages = async (userId) => {
  try {
    const result = await API.graphql(
      graphqlOperation(getUserMessages, { userId })
    );
    return result.data.listMessages.items;
  } catch (error) {
    console.error('Error fetching user messages:', error);
    throw error;
  }
};

export const fetchForumPosts = async (filter = {}, limit = 20, nextToken = null) => {
  try {
    const result = await API.graphql(
      graphqlOperation(getForumPostsWithComments, { filter, limit, nextToken })
    );
    return result.data.listForumPosts;
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    throw error;
  }
};