# Use the official MeiliSearch image
FROM getmeili/meilisearch:v1.7

# Expose port 7700
EXPOSE 7700

# Set the working directory to /meili_data
WORKDIR /meili_data

# Mount a volume for persistent data storage
VOLUME /meili_data

# Command to run the MeiliSearch server
CMD ["meilisearch"]