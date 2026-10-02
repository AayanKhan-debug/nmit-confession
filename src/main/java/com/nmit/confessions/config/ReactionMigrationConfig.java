package com.nmit.confessions.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class ReactionMigrationConfig {

    private final ReactionDataMigration reactionDataMigration;

    public ReactionMigrationConfig(ReactionDataMigration reactionDataMigration) {
        this.reactionDataMigration = reactionDataMigration;
    }

    @PostConstruct
    public void runMigration() {
        reactionDataMigration.migrate();
    }

    @Bean
    public static BeanFactoryPostProcessor entityManagerDependsOnReactionMigrationPostProcessor() {
        return new BeanFactoryPostProcessor() {
            @Override
            public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
                for (String name : beanFactory.getBeanNamesForType(jakarta.persistence.EntityManagerFactory.class)) {
                    BeanDefinition bd = beanFactory.getBeanDefinition(name);
                    String[] dependsOn = bd.getDependsOn();
                    bd.setDependsOn(StringUtils.addStringToArray(dependsOn, "reactionDataMigration"));
                }
            }
        };
    }
}
