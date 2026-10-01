package com.nmit.confessions.testutils;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;

public class PostgresLauncher {
    public static void main(String[] args) throws IOException {
        EmbeddedPostgres pg = EmbeddedPostgres.builder().setPort(15432).start();
        System.out.println("READY: jdbc:postgresql://localhost:15432/postgres");
        
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
