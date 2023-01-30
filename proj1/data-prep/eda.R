library(tidyverse)
library(extrafont)

tema <-   theme_minimal() +
  theme(text = element_text(family = 'Fira Code'),
        panel.grid.major.y = element_blank(),
        panel.grid.minor.y = element_blank(),
        legend.position = 'none'
  )

data_raw <- read.csv('proj1-data.csv')


data <- data_raw
colnames(data) <- c(
  'Timestamp',
  'alias',
  'about',
  'infovis',
  'stats',
  'math',
  'drawing',
  'computer',
  'programming',
  'cg-programming',
  'hci-programming',
  'ux',
  'comm',
  'collab',
  'git'
)

data_long <- data %>%
  select(infovis, stats, drawing, `hci-programming`, ux) %>%
  mutate(id = row_number()) %>%
  gather(-id, key = skill, value = value)

data_long_all <- data %>%
  select(-Timestamp) %>%
  gather(-alias, -about, key = skill, value = value)

write.csv(data_long_all, 'data-long.csv')

data_avg <- data %>%
  select(-Timestamp) %>%
  gather(-alias, -about, key = skills, value = value) %>%
  group_by(alias, about) %>%
  summarise(avg = mean(value))

data_avg_skills <- data %>%
  select(-Timestamp, -alias, -about) %>%
  gather(key = skills, value = value) %>%
  group_by(skills) %>%
  summarise(avg = mean(value))

# positions for dotplot
make_rank <- function(col) {
  
  temp_data <- data %>%
    group_by(.data[[col]]) %>%
    mutate(rank = row_number()) %>%
    ungroup()
  
  return(temp_data$rank)
  
}

data_with_positions <- data
for (skill in data_avg_skills$skills) {
  
  data_with_positions[, paste0('rank_', skill)] <- make_rank(skill)
  
}

max_ranks <- data_with_positions %>%
  select(contains('rank_')) %>%
  gather(key, value)

max_rank = max(max_ranks$value)

# export ------------------------------------------------------------------

output <- list(
  main_data = data_with_positions,
  averages = data_avg_skills,
  max_rank = max_rank
)

jsonlite::write_json(output, '../data.json')  
# find people that are good in skills that you are not?

# plots -------------------------------------------------------------------

ggplot(data_with_positions, aes(x = infovis, y = rank_infovis)) + geom_point(size = 3)

ggplot(data_avg) +
  geom_histogram(aes(x = avg), bins = 50)

ggplot(data) +
  geom_histogram(aes(x = infovis), bins = 11)

ggplot(data) + 
  geom_point(aes(x = infovis, y = programming))

ggplot(data_long) +
  geom_line(aes(x = skill, y = value, group = id))

ggplot(data_long_all) +
  geom_line(aes(x = skill, y = value, group = alias), alpha = .25)

ggplot(data_long_all) +
  geom_point(aes(x = skill, y = value, group = alias), alpha = .5) +
  geom_line(aes(x = skill, y = value, group = alias), alpha = .25) +
  geom_line(data = data_avg_skills, aes(x = skills, y = avg, group = 1), size = 2, color = '#DC143C')

