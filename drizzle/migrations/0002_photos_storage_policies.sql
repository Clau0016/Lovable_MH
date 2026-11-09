create policy photos_obj_read on storage.objects for select to authenticated using (bucket_id = 'photos');
create policy photos_obj_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy photos_obj_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);