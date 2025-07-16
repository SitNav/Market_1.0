import { API, graphqlOperation } from 'aws-amplify';

// GraphQL mutations for marketplace operations
export const createListingMutation = /* GraphQL */ `
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
      latitude
      longitude
      viewCount
      userId
      categoryId
      createdAt
      updatedAt
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
  }
`;

export const updateListingMutation = /* GraphQL */ `
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
      latitude
      longitude
      viewCount
      userId
      categoryId
      createdAt
      updatedAt
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
  }
`;

export const deleteListingMutation = /* GraphQL */ `
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

export const createMessageMutation = /* GraphQL */ `
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
        price
      }
    }
  }
`;

export const createCommentMutation = /* GraphQL */ `
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

export const createForumPostMutation = /* GraphQL */ `
  mutation CreateForumPost(
    $input: CreateForumPostInput!
    $condition: ModelForumPostConditionInput
  ) {
    createForumPost(input: $input, condition: $condition) {
      id
      title
      content
      viewCount
      userId
      categoryId
      createdAt
      updatedAt
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
  }
`;

export const updateUserMutation = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      email
      firstName
      lastName
      profileImageUrl
      createdAt
      updatedAt
    }
  }
`;

export const createReviewMutation = /* GraphQL */ `
  mutation CreateReview(
    $input: CreateReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    createReview(input: $input, condition: $condition) {
      id
      rating
      comment
      reviewerId
      reviewedUserId
      listingId
      createdAt
      updatedAt
      reviewer {
        id
        firstName
        lastName
        profileImageUrl
      }
      reviewedUser {
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

export const addToCartMutation = /* GraphQL */ `
  mutation CreateCartItem(
    $input: CreateCartItemInput!
    $condition: ModelCartItemConditionInput
  ) {
    createCartItem(input: $input, condition: $condition) {
      id
      quantity
      userId
      listingId
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
      }
      listing {
        id
        title
        price
        images
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const addToWishlistMutation = /* GraphQL */ `
  mutation CreateWishlistItem(
    $input: CreateWishlistItemInput!
    $condition: ModelWishlistItemConditionInput
  ) {
    createWishlistItem(input: $input, condition: $condition) {
      id
      userId
      listingId
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
      }
      listing {
        id
        title
        price
        images
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

// API helper functions
export const createListing = async (listingData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(createListingMutation, { input: listingData })
    );
    return result.data.createListing;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

export const updateListing = async (listingData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(updateListingMutation, { input: listingData })
    );
    return result.data.updateListing;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

export const deleteListing = async (id) => {
  try {
    const result = await API.graphql(
      graphqlOperation(deleteListingMutation, { input: { id } })
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
      graphqlOperation(createMessageMutation, { input: messageData })
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
      graphqlOperation(createCommentMutation, { input: commentData })
    );
    return result.data.createComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const createForumPost = async (postData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(createForumPostMutation, { input: postData })
    );
    return result.data.createForumPost;
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(updateUserMutation, { input: userData })
    );
    return result.data.updateUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const result = await API.graphql(
      graphqlOperation(createReviewMutation, { input: reviewData })
    );
    return result.data.createReview;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const addToCart = async (userId, listingId, quantity = 1) => {
  try {
    const result = await API.graphql(
      graphqlOperation(addToCartMutation, { 
        input: { userId, listingId, quantity } 
      })
    );
    return result.data.createCartItem;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const addToWishlist = async (userId, listingId) => {
  try {
    const result = await API.graphql(
      graphqlOperation(addToWishlistMutation, { 
        input: { userId, listingId } 
      })
    );
    return result.data.createWishlistItem;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};