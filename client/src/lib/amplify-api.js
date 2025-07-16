import { API, graphqlOperation } from 'aws-amplify';

// GraphQL queries
export const listListings = /* GraphQL */ `
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
        size
        color
        location
        city
        state
        zipCode
        viewCount
        userId
        categoryId
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
        }
      }
      nextToken
    }
  }
`;

export const getListing = /* GraphQL */ `
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
      viewCount
      userId
      categoryId
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
      }
      comments {
        items {
          id
          content
          userId
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
`;

export const listCategories = /* GraphQL */ `
  query ListCategories {
    listCategories {
      items {
        id
        name
        slug
        description
        createdAt
        updatedAt
      }
    }
  }
`;

export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        isRead
        senderId
        receiverId
        listingId
        createdAt
        updatedAt
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
        }
      }
      nextToken
    }
  }
`;

// GraphQL mutations
export const createListing = /* GraphQL */ `
  mutation CreateListing(
    $input: CreateListingInput!
    $condition: ModelListingConditionInput
  ) {
    createListing(input: $input, condition: $condition) {
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
      viewCount
      userId
      categoryId
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
      }
    }
  }
`;

export const updateListing = /* GraphQL */ `
  mutation UpdateListing(
    $input: UpdateListingInput!
    $condition: ModelListingConditionInput
  ) {
    updateListing(input: $input, condition: $condition) {
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
      viewCount
      userId
      categoryId
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
      }
    }
  }
`;

export const deleteListing = /* GraphQL */ `
  mutation DeleteListing(
    $input: DeleteListingInput!
    $condition: ModelListingConditionInput
  ) {
    deleteListing(input: $input, condition: $condition) {
      id
      title
      userId
    }
  }
`;

export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      content
      isRead
      senderId
      receiverId
      listingId
      createdAt
      updatedAt
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
      }
    }
  }
`;

export const createComment = /* GraphQL */ `
  mutation CreateComment(
    $input: CreateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    createComment(input: $input, condition: $condition) {
      id
      content
      userId
      listingId
      forumPostId
      parentId
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
        profileImageUrl
      }
    }
  }
`;

// API functions
export const fetchListings = async (filter = {}, limit = 20, nextToken = null) => {
  try {
    const result = await API.graphql(
      graphqlOperation(listListings, { filter, limit, nextToken })
    );
    return result.data.listListings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const fetchListing = async (id) => {
  try {
    const result = await API.graphql(graphqlOperation(getListing, { id }));
    return result.data.getListing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const result = await API.graphql(graphqlOperation(listCategories));
    return result.data.listCategories.items;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchMessages = async (filter = {}, limit = 50, nextToken = null) => {
  try {
    const result = await API.graphql(
      graphqlOperation(listMessages, { filter, limit, nextToken })
    );
    return result.data.listMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const addListing = async (listingData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(createListing, { input: listingData })
    );
    return result.data.createListing;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

export const editListing = async (listingData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(updateListing, { input: listingData })
    );
    return result.data.updateListing;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

export const removeListing = async (id) => {
  try {
    const result = await API.graphql(
      graphqlOperation(deleteListing, { input: { id } })
    );
    return result.data.deleteListing;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(createMessage, { input: messageData })
    );
    return result.data.createMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(createComment, { input: commentData })
    );
    return result.data.createComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};